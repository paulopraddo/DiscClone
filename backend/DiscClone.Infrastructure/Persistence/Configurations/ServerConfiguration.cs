using DiscClone.Domain.Servers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscClone.Infrastructure.Persistence.Configurations;

public sealed class ServerConfiguration : IEntityTypeConfiguration<Server>
{
    public void Configure(EntityTypeBuilder<Server> builder)
    {
        builder.ToTable("servers");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .HasConversion(name => name.Value, value => ServerName.Create(value).Value)
            .HasMaxLength(ServerName.MaxLength)
            .HasColumnName("name")
            .IsRequired();

        builder.Property(s => s.OwnerId)
            .HasColumnName("owner_id")
            .IsRequired();

        builder.Property(s => s.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.HasMany(s => s.Channels)
            .WithOne()
            .HasForeignKey(c => c.ServerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Metadata.FindNavigation(nameof(Server.Channels))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(s => s.Members)
            .WithOne()
            .HasForeignKey(m => m.ServerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Metadata.FindNavigation(nameof(Server.Members))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);
    }
}
