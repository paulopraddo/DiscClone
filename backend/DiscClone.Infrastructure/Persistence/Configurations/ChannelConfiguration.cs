using DiscClone.Domain.Channels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscClone.Infrastructure.Persistence.Configurations;

public sealed class ChannelConfiguration : IEntityTypeConfiguration<Channel>
{
    public void Configure(EntityTypeBuilder<Channel> builder)
    {
        builder.ToTable("channels");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.ServerId)
            .HasColumnName("server_id")
            .IsRequired();

        builder.Property(c => c.Name)
            .HasConversion(name => name.Value, value => ChannelName.Create(value).Value)
            .HasMaxLength(ChannelName.MaxLength)
            .HasColumnName("name")
            .IsRequired();

        builder.Property(c => c.Type)
            .HasConversion<string>()
            .HasColumnName("type")
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();
    }
}
